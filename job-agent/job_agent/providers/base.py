from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable

from ..models import JobPosting


class Provider(ABC):
    name: str

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    def search(self, query: str, location: str) -> Iterable[JobPosting]:
        raise NotImplementedError

