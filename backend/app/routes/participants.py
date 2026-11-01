# GET /trips/<id>/participants, POST /trips/<id>/participants.
# Владелец: Backend 1.
from flask import Blueprint, jsonify, request

from ..schemas.participant import CreateParticipantRequest, ParticipantResponse
from ..services import participant as participant_service

bp = Blueprint("participants", __name__)


@bp.get("/trips/<int:trip_id>/participants")
def list_participants(trip_id):
    try:
        participants = participant_service.get_participants(trip_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    return jsonify([ParticipantResponse.from_domain(p).to_dict() for p in participants])


@bp.post("/trips/<int:trip_id>/participants")
def add_participant(trip_id):
    try:
        dto = CreateParticipantRequest.from_json(request.get_json(silent=True))
        participant = participant_service.add_participant(
            trip_id, dto.first_name, dto.last_name
        )
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(ParticipantResponse.from_domain(participant).to_dict()), 201
