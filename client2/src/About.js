import React from 'react';

function About() {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h2 style={{ color: '#2a5298' }}>About This App</h2>
      <p style={{ fontSize: 18, marginTop: 16 }}>
        This is a simple React CRUD application for managing component records with a Node.js backend and local file storage.
      </p>
    </div>
  );
}

export default About;
