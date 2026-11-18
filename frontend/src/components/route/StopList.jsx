import StopCard from "./StopCard";
export default function StopList({ stops, onEdit, onDelete }) {
    const groups = new Map();
    for (const stop of stops) {
        if (!groups.has(stop.day_number)) groups.set(stop.day_number, []);
        groups.get(stop.day_number).push(stop);
    }
    const days = [...groups.keys()].sort((a, b) => a - b);

    return (
        <div className="stop-list">
            {days.map((day) => (
                <section key={day} className="stop-list__day">
                    <h3 className="stop-list__day-title">День {day}</h3>
                    <ul className="stop-list__items">
                        {groups.get(day).map((stop) => (
                            <StopCard key={stop.id} stop={stop} onEdit={onEdit} onDelete={onDelete} />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}