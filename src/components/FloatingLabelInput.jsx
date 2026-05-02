import React from 'react';

const FloatingLabelInput = ({ label, icon: Icon, className = '', ...props }) => {
  return (
    <div className={`floating-input-group ${className}`}>
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        {props.type === 'textarea' ? (
          <textarea
            {...props}
            placeholder=" "
            className={Icon ? 'with-icon' : ''}
          />
        ) : (
          <input 
            {...props}
            placeholder=" " 
            className={Icon ? 'with-icon' : ''}
          />
        )}
        <label className="floating-label">{label}</label>
      </div>
    </div>
  );
};

export default FloatingLabelInput;
