// Список участников. Только показывает то, что передал ParticipantsTab.
import ParticipantItem from "./ParticipantItem.jsx";

export default function ParticipantList({ participants }) {
  // Если участников нет, подсказываем, что делать, а не показываем пустой список.
  if (participants.length === 0) {
    return (
      <div className="participants-empty">
        <p className="participants-empty__title">Пока никого нет</p>
        <p className="participants-empty__text">Добавьте себя и тех, с кем едете.</p>
      </div>
    );
  }

  return (
    <ul className="participants-list">
      {participants.map((participant) => (
        <ParticipantItem key={participant.id} participant={participant} />
      ))}
    </ul>
  );
}
