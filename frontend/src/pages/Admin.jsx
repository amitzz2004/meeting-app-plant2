import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Admin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/admin/pending")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const approve = async (id) => {
    try {
      await API.post(`/admin/approve/${id}`);
      alert("Approved!");

      // refresh list
      const res = await API.get("/admin/pending");
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error approving");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Meetings</h2>

      {data.length === 0 ? (
        <p>No pending meetings</p>
      ) : (
        data.map(m => (
          <div key={m.id} style={{ marginBottom: "10px" }}>
            <strong>{m.title}</strong>
            <button onClick={() => approve(m.id)} style={{ marginLeft: "10px" }}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}