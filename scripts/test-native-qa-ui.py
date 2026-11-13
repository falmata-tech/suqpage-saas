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
            and n.name in {'UiHierarchyNotReady', 'tree', 'bounds', 'find'}]
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
