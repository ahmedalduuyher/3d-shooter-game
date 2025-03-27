import React, { useState } from 'react';

const ControlsMenu = ({ controls, onControlsChange, onBack }) => {
  const [currentControls, setCurrentControls] = useState(controls);
  const [listeningFor, setListeningFor] = useState(null);

  const handleKeyChange = (controlName, e) => {
    e.preventDefault();
    setListeningFor(controlName);
  };

  const handleKeyDown = (e) => {
    if (listeningFor) {
      e.preventDefault();
      
      // Get the key name
      let keyName = e.key;
      if (keyName === ' ') keyName = 'space';
      
      // Update the control
      const newControls = { ...currentControls, [listeningFor]: keyName };
      setCurrentControls(newControls);
      setListeningFor(null);
      
      // Notify parent component
      onControlsChange(newControls);
    }
  };

  React.useEffect(() => {
    if (listeningFor) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [listeningFor]);

  const controlLabels = {
    forward: 'Move Forward',
    left: 'Move Left',
    backward: 'Move Backward',
    right: 'Move Right',
    jump: 'Jump',
    reload: 'Reload',
    pickup: 'Pick Up Weapon',
    crouch: 'Crouch'
  };

  return (
    <div className="controls-menu" onKeyDown={handleKeyDown} tabIndex="0">
      <h2>Controls</h2>
      
      <div className="control-list">
        {Object.keys(currentControls).map(control => (
          <div className="control-item" key={control}>
            <span>{controlLabels[control]}</span>
            <button 
              className="control-key"
              onClick={(e) => handleKeyChange(control, e)}
            >
              {listeningFor === control ? 'Press a key...' : currentControls[control] === ' ' ? 'space' : currentControls[control]}
            </button>
          </div>
        ))}
      </div>
      
      <div className="fixed-controls">
        <h3>Fixed Controls</h3>
        <div className="control-item">
          <span>Shoot</span>
          <div className="control-key">Left Click</div>
        </div>
        <div className="control-item">
          <span>Scope</span>
          <div className="control-key">Right Click</div>
        </div>
        <div className="control-item">
          <span>Scoreboard</span>
          <div className="control-key">Tab</div>
        </div>
      </div>
      
      <button onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default ControlsMenu;
