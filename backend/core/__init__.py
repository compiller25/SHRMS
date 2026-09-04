"""Project bootstrap: apply a compatibility patch so Django admin pages render
on Python 3.14.

Django 5.0.7's BaseContext.__copy__ does `duplicate = copy(super())`, which
returns a `super` proxy without a writable __dict__ on Python 3.14 and crashes
every admin changelist with "AttributeError: 'super' object has no attribute
'dicts'". Build the copy from the instance directly instead: create an empty
instance of the same class (bypassing __copy__, which is the recursion source)
and copy the full instance state over, so attributes like `template`,
`render_context`, and `path` survive the copy.
"""
from django.template.context import BaseContext as _BaseContext


def _context_copy(self):
    duplicate = self.__class__.__new__(self.__class__)
    duplicate.__dict__.update(self.__dict__)
    duplicate.dicts = self.dicts[:]
    return duplicate


_BaseContext.__copy__ = _context_copy