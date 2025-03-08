import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';

export interface Item {
  id: number;
  name: string;
}

interface ClearableInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  items: Item[];
  onSelectItem?: (item: Item) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const ClearableInput: React.FC<ClearableInputProps> = ({
  id,
  value,
  onChange,
  onClear,
  placeholder,
  items,
  onSelectItem,
  onKeyDown,
}) => {
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (!inputValue.trim()) {
      setFilteredItems([]);
      setShowDropdown(false);
      return;
    }

    const results = items
      .filter(item => item.name.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 10);

    setFilteredItems(results);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (item: Item) => {
    onChange(item.name);
    if (onSelectItem) onSelectItem(item);
    setShowDropdown(false);
  };

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredItems.length === 0) {
      if (onKeyDown) onKeyDown(e);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredItems[highlightedIndex]);
    }

    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder || 'Search for an item'}
        style={{ width: '100%', padding: '8px', borderRadius: '5px' }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'gray',
            cursor: 'pointer',
          }}
        >
          ❌
        </button>
      )}
      {showDropdown && filteredItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: 'black',
            color: 'white',
            border: '1px solid gray',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: '8px',
                cursor: 'pointer',
                background: index === highlightedIndex ? '#555' : 'transparent',
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelect(item)}
            >
              {item.name} (ID: {item.id})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClearableInput;
