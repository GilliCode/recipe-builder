import React, { useState, useEffect } from 'react';

const isMobile = () => window.innerWidth <= 768;

const ClearableInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}> = ({ value, onChange, onClear }) => {
  const [mobile, setMobile] = useState(isMobile());

  // ✅ Re-check screen size on resize
  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Name or ID"
        style={{
          flex: 1,
          padding: mobile ? '8px 30px 8px 8px' : '8px',
          borderRadius: '5px',
        }}
      />


      {mobile && value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: 'gray',
            cursor: 'pointer',
            fontSize: '18px',
          }}
          title="Clear"
        >
          ❌
        </button>
      )}


      {!mobile && value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            marginLeft: '10px',
            background: '#888',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ClearableInput;
