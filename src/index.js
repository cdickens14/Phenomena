import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

const App = () => {
    const [reports, setReports] = useState([]);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const getReports = async() => {
            try {
                const response = await axios.get('/api/reports');
                setReports(response.data.reports);
            } catch (err) {
              console.log (err);
            }
            
        }
        getReports();
    }, []);

    const onChange = (event) => {
        if(event.target.name === 'title') {
            setTitle(event.target.value);
        } else if(event.target.name === 'location') {
            setLocation(event.target.value);
        } else if(event.target.name === 'description') {
            setDescription(event.target.value);
        } else {
            setPassword(event.target.value);
        }
    }

    const createReport = async(event) => {
        event.preventDefault();
        try {
            const newReport = await axios.post('/api/reports', {
                title,
                location,
                description,
                password
            });
            setReports([...reports, response.data]);
        } catch (err) {
          console.log (err);
        }
    }

return (
    <React.Fragment>
        <h1>Phenomena</h1>

        <ul>
            {
              reports.map((report, i) => {
                return <li key={i}>{report.title}</li>
              })

            }

        </ul>
            

        <form onSubmit={ createReport }>
            <input value={title} onChange={onChange} name='title' placeholder='title'></input>
            <input value={location} onChange={onChange} name='location' placeholder='location'></input>
            <input value={description} onChange={onChange} name='description' placeholder='description'></input>
            <input value={password} onChange={onChange} name='password' placeholder='password'></input>
            <button>Create Report</button>
        </form>

    </React.Fragment>
)
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);