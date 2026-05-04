import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import '../styles/Dropdown.css';

const Dropdown = ({
    label,
    options = [],
    value,
    onChange,
    icon: Icon,
    placeholder = "Select an option",
    searchable = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`premium-dropdown-group ${className} ${isOpen ? 'is-open' : ''} ${selectedOption ? 'has-value' : ''}`} ref={dropdownRef}>
            <div className="dropdown-container">
                <button
                    type="button"
                    className={`dropdown-trigger ${Icon ? 'with-icon' : ''} ${!selectedOption ? 'is-placeholder' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {Icon && <Icon size={18} className="trigger-icon" />}
                    <div className="dropdown-content">
                        {label && <label className="floating-label">{label}</label>}
                        <span className="trigger-text">
                            {selectedOption ? selectedOption.label : ''}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
                </button>

                {isOpen && (
                    <div className="dropdown-menu animate-dropdown">
                        {searchable && (
                            <div className="dropdown-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="dropdown-options">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <span className="option-label">{option.label}</span>
                                        {value === option.value && <Check size={16} className="selected-icon" />}
                                    </div>
                                ))
                            ) : (
                                <div className="no-options">No results found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
