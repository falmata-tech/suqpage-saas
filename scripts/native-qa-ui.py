"""DEP-053: bounded actual Android interactions, using observed native nodes."""
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path('.local/native-qa')
OUT = ROOT / 'evidence'
APP = 'com.africmade.qa'
OUT.mkdir(parents=True, exist_ok=True)
fixture = json.loads((ROOT / 'fixture.json').read_text())
steps = []
started = time.monotonic()


def run(args, timeout=30, binary=False):
    return subprocess.run(args, check=True, capture_output=True, timeout=timeout,
                          text=not binary).stdout


def adb(*args, **kwargs):
    return run(['adb', '-s', os.environ.get('ANDROID_SERIAL', 'emulator-5554'), *args], **kwargs)


class UiHierarchyNotReady(RuntimeError):
    pass


def tree():
    try:
        # A busy launch/bundle can return success without writing a hierarchy.
        # Clear our previous dump so it can never masquerade as current state.
        adb('shell', 'rm', '-f', '/sdcard/africmade-qa.xml')
        adb('shell', 'uiautomator', 'dump', '/sdcard/africmade-qa.xml', timeout=20)
        source = adb('shell', 'cat', '/sdcard/africmade-qa.xml')
    except subprocess.CalledProcessError as error:
        detail = (error.stdout or '') + (error.stderr or '')
        if 'No such file' in detail or 'idle state' in detail:
            raise UiHierarchyNotReady('Android is still preparing its current UI hierarchy') from error
        raise
    (ROOT / 'current.xml').write_text(source)
    return ET.fromstring(source)


def bounds(node):
    values = [int(v) for v in re.findall(r'\d+', node.get('bounds', ''))]
    return values if len(values) == 4 else [0, 0, 0, 0]


def find(label, timeout=40, scroll=False):
    deadline = time.monotonic() + timeout
    swipes = 0
    while time.monotonic() < deadline:
        try:
            nodes = tree()
        except UiHierarchyNotReady:
            time.sleep(1)
            continue
        matches = [n for n in nodes.iter('node') if label in (n.get('text'), n.get('content-desc'))
                   and n.get('enabled') == 'true' and bounds(n)[2] > bounds(n)[0]]
        if matches:
            matches.sort(key=lambda n: n.get('clickable') != 'true')
            return matches[0]
        if scroll and swipes < 8:
            size = re.findall(r'(\d+)x(\d+)', adb('shell', 'wm', 'size'))[-1]
            width, height = map(int, size)
            adb('shell', 'input', 'swipe', str(width // 2), str(int(height * .72)),
                str(width // 2), str(int(height * .32)), '350')
            swipes += 1
        time.sleep(1)
    raise AssertionError('Missing native control: ' + label)


def tap(label, **kwargs):
    x1, y1, x2, y2 = bounds(find(label, **kwargs))
    adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))


def type_into(label, text):
    tap(label, scroll=True)
    # Synthetic ASCII fixture values only; quote for the Android shell as well.
    if not re.fullmatch(r'[A-Za-z0-9 +.-]+', text):
        raise AssertionError('Unsupported fixture input')
    adb('shell', 'input', 'text', shlex.quote(text.replace(' ', '%s')))


def capture(name):
    (OUT / (name + '.png')).write_bytes(adb('exec-out', 'screencap', '-p', binary=True))
    (OUT / (name + '.xml')).write_text(ET.tostring(tree(), encoding='unicode'))
    steps.append({'step': name, 'elapsedSeconds': round(time.monotonic() - started, 1)})


def wait_backend():
    for _ in range(90):
        try:
            url = 'http://127.0.0.1:3000/api/mobile/v1/shops/' + fixture['handle']
            with urllib.request.urlopen(url, timeout=5) as response:
                shop = json.load(response)
            assert shop['id'] == fixture['businessId'] and shop['isDemo']
            assert any(p['id'] == fixture['productId'] and not p['options'] for p in shop['products'])
            return
        except (OSError, ValueError):
            time.sleep(1)
    raise AssertionError('Disposable public API did not become ready')


result = 'failed'
failure = None
try:
    apk = ROOT / 'client.apk'
    tools = sorted((Path(os.environ['ANDROID_HOME']) / 'build-tools').glob('*/aapt'))
    if not tools:
        raise AssertionError('Android aapt is unavailable')
    badging = run([str(tools[-1]), 'dump', 'badging', str(apk)])
    assert "package: name='com.africmade.qa'" in badging and 'application-debuggable' in badging
    native = json.loads((ROOT / 'native-build.json').read_text())
    assert native['key'] == os.environ['NATIVE_QA_CACHE_KEY']
    assert native['sha256'] == hashlib.sha256(apk.read_bytes()).hexdigest()
    (OUT / 'artifact.json').write_text(json.dumps({'javascriptSource': fixture['source'],
        'nativeSource': native['source'], 'nativeInputsKey': native['key'],
        'apkSha256': hashlib.sha256(apk.read_bytes()).hexdigest(), 'package': APP,
        'debuggable': True, 'api': adb('shell', 'getprop', 'ro.build.version.sdk').strip(),
        'abi': adb('shell', 'getprop', 'ro.product.cpu.abi').strip(),
        'dataTarget': 'disposable-local-postgres', 'map': 'synthetic-background'}, indent=2))
    wait_backend()
    adb('install', '-r', str(apk), timeout=90)
    adb('reverse', 'tcp:8081', 'tcp:8081')
    adb('logcat', '-c')
    launch = 'exp+africmade-qa://expo-development-client/?url=' + urllib.parse.quote('http://localhost:8081', safe='')
    launch += '&disableOnboarding=1&disableFab=1&disableAutoLaunch=1'
    adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', shlex.quote(launch), APP)
    find('Business locations', timeout=180)
    capture('01-market-map')
    tap('Product listings')
    find('Search products')
    capture('02-product-search')
    type_into('Search products', fixture['productName'])
    capture('03-search-keyboard')
    adb('shell', 'input', 'keyevent', '4')
    tap(fixture['productName'], timeout=60)
    find(fixture['businessName'], timeout=60)
    capture('04-product')
    adb('shell', 'input', 'keyevent', '4')
    find('Search products')
    find(fixture['productName'])
    capture('05-native-back-retains-search')
    tap(fixture['productName'])
    tap('Add to inquiry list', scroll=True)
    find('Added to inquiry list')
    capture('06-product-added')
    tap('View inquiry list (1)')
    find(fixture['productName'])
    tap('Send to AfricMade Inbox', scroll=True)
    type_into('Your name', 'NativeQA')
    type_into('Phone number', '+447700900999')
    capture('07-inquiry-keyboard')
    adb('shell', 'input', 'keyevent', '4')
    tap('Send inquiry', scroll=True)
    find('Inquiry sent to the business.', timeout=60)
    capture('08-inquiry-received')
    tap('About')
    find('About AfricMade', timeout=45)
    capture('09-about')
    tap('Login')
    find('Sign in to AfricMade.')
    capture('10-login-entry')
    result = 'passed'
except Exception as error:
    failure = str(error)[:500]
    try:
        capture('failure')
    except Exception:
        pass
    raise
finally:
    (OUT / 'ui-report.json').write_text(json.dumps({'source': fixture['source'], 'result': result,
        'failedReason': failure, 'steps': steps, 'authAndPush': 'not exercised'}, indent=2))
    try:
        logs = adb('logcat', '-d', '-s', 'AndroidRuntime:E', 'ReactNativeJS:E')
        (ROOT / 'device-errors.log').write_text(logs)
        fatal = 'FATAL EXCEPTION' in logs
        (OUT / 'crash-summary.json').write_text(json.dumps({'fatalException': fatal}))
        if fatal and result == 'passed':
            raise AssertionError('Android reported a fatal exception; inspect protected local logs')
    except subprocess.SubprocessError:
        pass
