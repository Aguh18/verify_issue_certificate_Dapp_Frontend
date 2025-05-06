import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarButton = ({ props }) => {
    const { text, icon, link } = props;

    return (
        <NavLink
            to={link}
            className={({ isActive }) =>
                `flex items-center w-full px-4 py-2 text-black rounded-md mb-1 transition-colors duration-200 ${isActive ? 'bg-blue-700 font-bold' : 'hover:bg-blue-500'
                }`
            }
        >
            <i className={`fas fa-${icon} mr-2 text-lg`}></i>
            <span className="text-base">{text}</span>
        </NavLink>
    );
};

export default SidebarButton;