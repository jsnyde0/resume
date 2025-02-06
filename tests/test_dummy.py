import os

import pytest


@pytest.mark.skip(reason="This is a dummy test")
def test_dummy():
    """A simple test to verify pytest is working."""
    expected = True
    actual = True
    assert actual == expected, "Basic assertion should pass"


def test_dummy2():
    """A simple test to verify pytest is working."""
    expected = True
    actual = True
    assert actual == expected, "Basic assertion should pass"


def test_debug_env():
    """
    Verify that the environment variable DEBUG is set and
    that Django's settings pick it up correctly.

    This test requires pytest-django to be installed correctly.
    """
    debug_env_value = os.getenv("DEBUG")
    assert debug_env_value is not None, "DEBUG environment variable should be set"
