// src/components/Button.jsx
import React from 'react';

const Button = ({ children, type = 'button', variant = 'primary', onClick }) => (
  <button className={`btn btn-${variant}`} type={type} onClick={onClick}>
    {children}
  </button>
);

export default Button;
