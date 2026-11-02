// Admin.jsx — overzicht van studenten en hun antwoorden
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, getHistoryForUser } from "../services/wordService";

const dagen = (n) => `${n} ${n === 1 ? "dag" : "dagen"}`;

function Admin() {
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [fout, setFout] = useState("");
  const [historyFout, setHistoryFout] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        setFout("Studenten konden niet geladen worden.");
        setUsers([]);
      });
  }, []);

  // Antwoorden van de geselecteerde student ophalen
  useEffect(() => {
    if (!selected) return;

    let active = true;

    getHistoryForUser(selected.id)
      .then((data) => {
        if (active) setHistory(data);
      })
      .catch((err) => {
        console.error(err);

        if (active) {
          setHistoryFout("Antwoorden konden niet geladen worden.");
          setHistory([]);
        }
      });

    return () => {
      active = false;
    };
  }, [selected]);

  const openUser = (user) => {
    setHistory(null);
    setHistoryFout("");
    setSelected(user);
  };

  const terug = () => {
    setSelected(null);
    setHistory(null);
    setHistoryFout("");
  };

  return (
    <main className="pagina">
      <section className="admin-dashboard">
        <header className="admin-dashboard__header">
          <div>
            <h1 className="admin-dashboard__titel">
              Adminoverzicht
            </h1>
            <p className="admin-dashboard__subtitel">
              Bekijk de voortgang van studenten en beheer de woorden.
            </p>
          </div>

          <Link
            to="/admin/woorden"
            className="knop admin-dashboard__beheer"
          >
            Woorden beheren →
          </Link>
        </header>

        {selected ? (
          <>
            <button
              type="button"
              className="link-knop admin-dashboard__terug"
              onClick={terug}
            >
              ← Terug naar studenten
            </button>

            <section
              className="kaart admin-dashboard__student"
              aria-label="Geselecteerde student"
            >
              <div>
                <h2>{selected.name}</h2>
                <p>Overzicht van woorden en antwoorden</p>
              </div>

              <div className="admin-dashboard__badges">
                <span className="admin-dashboard__badge">
                  Streak: {dagen(selected.streak ?? 0)}
                </span>
                <span className="admin-dashboard__badge">
                  {selected.punten ?? 0} punten
                </span>
              </div>
            </section>

            <div className="kaart admin-dashboard__tabelvak">
              <table className="admin-dashboard__tabel">
                <caption className="admin-dashboard__caption">
                  Antwoorden van {selected.name}
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Woord</th>
                    <th scope="col">Antwoord</th>
                    <th scope="col">Resultaat</th>
                  </tr>
                </thead>

                <tbody>
                  {history === null && (
                    <tr>
                      <td colSpan={3} className="admin-dashboard__melding">
                        Antwoorden laden...
                      </td>
                    </tr>
                  )}

                  {historyFout && (
                    <tr>
                      <td
                        colSpan={3}
                        className="admin-dashboard__melding feedback--fout"
                      >
                        {historyFout}
                      </td>
                    </tr>
                  )}

                  {history?.length === 0 && !historyFout && (
                    <tr>
                      <td colSpan={3} className="admin-dashboard__melding">
                        Deze student heeft nog geen antwoorden.
                      </td>
                    </tr>
                  )}

                  {history?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.word}</td>
                      <td>{item.answer}</td>
                      <td>
                        <span
                          className={`admin-dashboard__resultaat ${
                            item.correct
                              ? "admin-dashboard__resultaat--goed"
                              : "admin-dashboard__resultaat--fout"
                          }`}
                        >
                          {item.correct ? "✓ Goed" : "✕ Fout"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="admin-dashboard__sectiekop">
              <h2>Studenten</h2>

              {users !== null && !fout && (
                <span className="admin-dashboard__badge">
                  {users.length} studenten
                </span>
              )}
            </div>

            <p className="admin-dashboard__hint">
              Klik op de naam van een student om de antwoorden te bekijken.
            </p>

            <div className="kaart admin-dashboard__tabelvak">
              <table className="admin-dashboard__tabel">
                <caption className="admin-dashboard__caption">
                  Studenten met hun streak en punten
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Naam</th>
                    <th scope="col">Streak</th>
                    <th scope="col">Punten</th>
                  </tr>
                </thead>

                <tbody>
                  {users === null && (
                    <tr>
                      <td colSpan={3} className="admin-dashboard__melding">
                        Studenten laden...
                      </td>
                    </tr>
                  )}

                  {fout && (
                    <tr>
                      <td
                        colSpan={3}
                        className="admin-dashboard__melding feedback--fout"
                      >
                        {fout}
                      </td>
                    </tr>
                  )}

                  {users?.length === 0 && !fout && (
                    <tr>
                      <td colSpan={3} className="admin-dashboard__melding">
                        Nog geen studenten.
                      </td>
                    </tr>
                  )}

                  {users?.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <button
                          type="button"
                          className="admin-dashboard__studentknop"
                          onClick={() => openUser(user)}
                          aria-label={`Bekijk antwoorden van ${user.name}`}
                        >
                          {user.name}
                          <span aria-hidden="true">→</span>
                        </button>
                      </td>

                      <td>{dagen(user.streak ?? 0)}</td>

                      <td>
                        <span className="admin-dashboard__punten">
                          {user.punten ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Admin;