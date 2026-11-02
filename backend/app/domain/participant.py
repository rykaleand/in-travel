from dataclasses import dataclass


@dataclass
class Participant:
    id: int
    trip_id: int
    first_name: str
    last_name: str