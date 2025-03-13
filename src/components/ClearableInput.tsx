import React, { useState, useEffect, useRef, forwardRef, CSSProperties } from 'react';
import { Item } from '../types';

export interface ClearableInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  items: Item[];
  onSelectItem: (item: Item) => void;
  style?: CSSProperties;
}

const ClearableInput = forwardRef<HTMLInputElement, ClearableInputProps>(
  ({ value, onChange, onClear, placeholder, items, onSelectItem, style }, ref) => {
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
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

    useEffect(() => {
      if (value.trim() === '') {
        setFilteredItems([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        return;
      }
      const lowerInput = value.toLowerCase();
      const results = items.filter(item => item.name.toLowerCase().includes(lowerInput)).slice(0, 10);
      setFilteredItems(results);
      setShowDropdown(results.length > 0);
      setHighlightedIndex(results.length > 0 ? 0 : -1);
    }, [value, items]);

    const handleSelect = (item: Item) => {
      onChange(item.name);
      onSelectItem(item);
      setFilteredItems([]);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showDropdown && filteredItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
            handleSelect(filteredItems[highlightedIndex]);
          }
        } else if (e.key === 'Escape') {
          setShowDropdown(false);
          setHighlightedIndex(-1);
        }
      }
    };

    const iconStyle: CSSProperties = {
      width: '24px',
      height: '24px',
      objectFit: 'contain',
      marginRight: '4px',
    };

    return (
      <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ width: style?.width || '100%', padding: '8px', borderRadius: '5px', border: '1px solid #555' }}
        />
        {value && (
          <button type="button" onClick={onClear} className="clear-button">
            ❌
          </button>
        )}
        {showDropdown && filteredItems.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: style?.width || '100%',
              background: '#2b2b2b',
              color: '#fff',
              border: '1px solid #555',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
            }}
          >
            {filteredItems.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '8px',
                    background: isHighlighted ? '#444' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.icon && <img src={item.icon} alt="" style={iconStyle} />}
                  {item.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

ClearableInput.displayName = 'ClearableInput';
export default ClearableInput;
