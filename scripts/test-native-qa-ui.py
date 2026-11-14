"""Exercise actual driver readiness functions with controlled ADB/clock ports."""
import ast
from pathlib import Path
import re
import subprocess
import tempfile
from types import SimpleNamespace
import xml.etree.ElementTree as ET

source = ast.parse(Path('scripts/native-qa-ui.py').read_text())
selected = [n for n in source.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))
            and n.name in {'UiHierarchyNotReady', 'tree', 'bounds', 'find', 'dismiss_keyboard',
                           'public_crash_summary'}]
code = compile(ast.Module(body=selected, type_ignores=[]), 'actual-native-driver', 'exec')
xml = '<hierarchy><node text="Business locations" enabled="true" clickable="true" bounds="[0,0][100,40]"/></hierarchy>'


def fixture(root, busy, broken=False):
    state = {'time': 0, 'dumps': 0, 'clears': 0, 'current': None}

    def adb(*args, **kwargs):
        if broken:
            raise ConnectionError('Disconnected fixture device')
        if args[1] == 'rm':
            state['clears'] += 1
            state['current'] = None
        elif args[1] == 'uiautomator':
            state['dumps'] += 1
            if state['dumps'] > busy:
                state['current'] = xml
        elif args[1] == 'cat':
            if state['current'] is None:
                raise subprocess.CalledProcessError(1, ['adb'], stderr='No such file or directory')
            return state['current']
        return ''

    clock = SimpleNamespace(monotonic=lambda: state['time'], sleep=lambda n: state.update(time=state['time'] + n))
    scope = {'ROOT': Path(root), 'adb': adb, 'ET': ET, 're': re, 'time': clock, 'subprocess': subprocess}
    exec(code, scope)
    return state, scope['find']


with tempfile.TemporaryDirectory() as root:
    state, find = fixture(root, busy=1)
    assert find('Business locations', timeout=3).get('text') == 'Business locations'
    assert state['time'] == 1 and state['clears'] == state['dumps'] == 2
    state, find = fixture(root, busy=100)
    try:
        find('Business locations', timeout=3)
        raise AssertionError('Permanent non-readiness was accepted')
    except AssertionError as error:
        assert 'Missing native control' in str(error)
    assert state['time'] == 3 and state['clears'] == 3
    _, find = fixture(root, busy=0, broken=True)
    try:
        find('Business locations', timeout=3)
        raise AssertionError('A disconnection was hidden')
    except ConnectionError:
        pass
print('PASS native driver busy-start retry, fresh hierarchy, finite deadline and device-error propagation.')

# The live keyboard/search screen exposes both an EditText containing the typed
# product name and a product Button with that same accessible label.
with tempfile.TemporaryDirectory() as root:
    xml = '<hierarchy><node text="Product" class="android.widget.EditText" enabled="true" clickable="true" bounds="[0,0][100,40]"/><node content-desc="Product" class="android.widget.Button" enabled="true" clickable="true" bounds="[0,50][100,100]"/></hierarchy>'
    _, find = fixture(root, busy=0)
    assert find('Product', widget='android.widget.Button').get('content-desc') == 'Product'
print('PASS native product action is distinct from identically named search input.')

with tempfile.TemporaryDirectory() as root:
    xml = '<hierarchy><node text="Your name" class="android.widget.TextView" enabled="true" bounds="[0,99][100,100]"/><node content-desc="Your name" class="android.widget.EditText" enabled="true" bounds="[0,50][100,98]"/></hierarchy>'
    _, find = fixture(root, busy=0)
    assert find('Your name', widget='android.widget.EditText').get('class') == 'android.widget.EditText'
for shown in [False, True]:
    calls = []

    def ime_adb(*args):
        calls.append(args)
        return 'mInputShown=' + str(shown).lower()

    scope = {'adb': ime_adb, 're': re}
    exec(code, scope)
    scope['dismiss_keyboard']()
    assert len(calls) == (2 if shown else 1)
print('PASS native inputs exclude clipped labels and hide only an observed keyboard before form scrolling.')

with tempfile.TemporaryDirectory() as root:
    scope = {'APP': 'com.africmade.qa', 're': re}
    exec(code, scope)
    public_crash_summary = scope['public_crash_summary']
    logs = ('11-14 E ReactNativeJS: TypeError: private@example.com ' +
            'https://private.example/secret?token=abc123\n' +
            '11-14 E AndroidRuntime: FATAL EXCEPTION: mqt_js\n' +
            '11-14 E AndroidRuntime: Process: com.africmade.qa, PID: 913\n' +
            '11-14 E AndroidRuntime: java.lang.RuntimeException: api-key=secret123\n' +
            '11-14 E AndroidRuntime:   at com.facebook.react.JSApplication.onError(App.java:52)\n')
    report = public_crash_summary(logs)
    assert report['fatalException'] is True
    assert report['fatalProcesses'] == ['qa-app']
    assert report['exceptionTypes'] == ['TypeError', 'java.lang.RuntimeException']
    assert report['stackMethods'] == ['com.facebook.react.JSApplication.onError']
    assert report['logLinesExamined'] == 5
    serialized = str(report)
    assert all(secret not in serialized for secret in
               ['private@example.com', 'private.example', 'secret123', 'abc123'])
    assert public_crash_summary('11-14 E AndroidRuntime: No exception')['fatalException'] is False
    other = public_crash_summary('11-14 E AndroidRuntime: FATAL EXCEPTION: main\n'
                                 '11-14 E AndroidRuntime: Process: com.unexpected.app, PID: 3')
    assert other['fatalProcesses'] == ['other']
    many = public_crash_summary('\n'.join('11-14 E AndroidRuntime: at com.example.C%d.fail(F.java:1)' % i
                                           for i in range(1000)))
    assert many['logLinesExamined'] == 1000 and len(many['stackMethods']) == 16
print('PASS native crash receipt retains bounded identifiers without raw messages or runtime data.')
