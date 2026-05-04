import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FloatingLabelInput = ({ label, icon: Icon, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

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
          <>
            <input 
              {...props}
              type={inputType}
              placeholder=" " 
              className={`${Icon ? 'with-icon' : ''} ${isPassword ? 'pr-12' : ''}`}
            />
            {isPassword && (
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </>
        )}
        <label className="floating-label">{label}</label>
      </div>
    </div>
  );
};

export default FloatingLabelInput;
