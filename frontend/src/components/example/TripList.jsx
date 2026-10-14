// ПРИМЕР компонента: только показывает список, который ему передали.
export default function TripList({ trips }) {
  return (
    <ul>
      {trips.map((trip) => (
        <li key={trip.id}>
          {trip.name} (код: {trip.invite_code})
        </li>
      ))}
    </ul>
  );
}
