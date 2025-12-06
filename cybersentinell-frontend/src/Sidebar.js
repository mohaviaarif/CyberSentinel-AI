import React from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoIcon from '@mui/icons-material/Info';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PageviewIcon from '@mui/icons-material/Pageview';

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar-pro sidebar-ent-pro ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header-ent">
        <div className="sidebar-logo-ent">
          <div className="sidebar-logo-circle"><HomeIcon fontSize="medium" /></div>
          <span className={`sidebar-app-name-ent ${collapsed ? 'collapsed' : ''}`} title="Cyber Sentinell">Cyber Sentinell</span>
        </div>
        <button className="sidebar-toggle-ent" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          <span className="sidebar-toggle-icon-ent">{collapsed ? '☰' : '✕'}</span>
        </button>
      </div>
      <nav className="sidebar-nav-pro">
        <NavLink to="/" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><HomeIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'Home'}</NavLink>
        <NavLink to="/about" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><InfoIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'About'}</NavLink>
        <NavLink to="/features" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><LightbulbIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'Features'}</NavLink>
        <NavLink to="/faq" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><QuestionAnswerIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'FAQ'}</NavLink>
        <NavLink to="/contact" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><ContactMailIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'Contact'}</NavLink>
        <NavLink to="/analyze" className={({isActive})=> 'sidebar-nav-item-pro' + (isActive?' active':'')}><PageviewIcon style={{verticalAlign:'middle'}} /> {!collapsed && 'Analyze Email'}</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
