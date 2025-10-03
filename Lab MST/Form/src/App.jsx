import { useState } from "react";

function App() {
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [data, setData] = useState([]);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();
    setData([...data, form]);
    setForm({ name: "", email: "", course: "" }); 
  };

  return (
    <div>
      <form onSubmit={submit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={change}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={change}
        />
        <input
          name="course"
          placeholder="Course"
          value={form.course}
          onChange={change}
        />
        <button type="submit">Add</button>
      </form>

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.email}</td>
              <td>{d.course}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
