// Один участник: кружок с инициалами и полное имя.
import { fullName, getInitials } from "../../utils/common-utils.js";

export default function ParticipantItem({ participant }) {
  return (
    <li className="participant-item">
      <span className="participant-item__avatar" aria-hidden="true">{getInitials(participant)}</span>
      <span className="participant-item__name">{fullName(participant)}</span>
    </li>
  );
}
