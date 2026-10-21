# Сюда импортируются все модели, чтобы SQLAlchemy создал таблицы.
from .expense import ExpenseModel, ExpenseShareModel  # noqa: F401
from .participant import ParticipantModel  # noqa: F401
from .route_stop import RouteStopModel  # noqa: F401
from .trip import TripModel  # noqa: F401
