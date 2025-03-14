// src/components/ClearableInput.tsx
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  CSSProperties,
  KeyboardEvent,
} from 'react';
import { Item } from '../types';

interface ClearableInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  items: Item[];
  onSelectItem: (item: Item) => void;
  style?: CSSProperties;
}

/**
 * Compute the Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Returns true if the query fuzzily matches the text.
 * It first checks if the query is a substring.
 * If not, it computes the Levenshtein distance and returns true if the distance is within a threshold.
 */
function fuzzyMatch(query: string, text: string): boolean {
  query = query.toLowerCase();
  text = text.toLowerCase();
  if (text.includes(query)) return true;
  // Use a threshold: allow a distance up to half the query length.
  const threshold = Math.floor(query.length / 2);
  return levenshteinDistance(query, text) <= threshold;
}

const ClearableInput = forwardRef<HTMLInputElement, ClearableInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder,
      items,
      onSelectItem,
      style,
    },
    ref
  ) => {
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [hasSelected, setHasSelected] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown if user clicks outside
    useEffect(() => {
      const handleClickOutside = (event: Event) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Filter items whenever `value` or `items` changes
    useEffect(() => {
      if (hasSelected) {
        setShowDropdown(false);
        return;
      }
      if (value.trim() === '') {
        setFilteredItems([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        return;
      }
      const lowerInput = value.toLowerCase();
      const results = items.filter((item) => {
        // Fuzzy match on item name OR check if the item id (as string) includes the query
        return (
          fuzzyMatch(lowerInput, item.name) ||
          item.id.toString().includes(lowerInput)
        );
      }).slice(0, 10);

      setFilteredItems(results);
      setShowDropdown(results.length > 0);
      setHighlightedIndex(results.length > 0 ? 0 : -1);
    }, [value, items, hasSelected]);

    // When an item is selected, update state and close dropdown
    const handleSelect = (item: Item) => {
      onChange(item.name);
      onSelectItem(item);
      setFilteredItems([]);
      setShowDropdown(false);
      setHighlightedIndex(-1);
      setHasSelected(true);
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (showDropdown && filteredItems.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(
            (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
          );
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredItems.length
          ) {
            handleSelect(filteredItems[highlightedIndex]);
          }
        } else if (e.key === 'Escape') {
          setShowDropdown(false);
          setHighlightedIndex(-1);
        }
      }
    };

    return (
      <div
        ref={wrapperRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          ...style,
        }}
      >
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => {
            setHasSelected(false); // reset flag when user types
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: style?.width || '100%',
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #555',
            boxSizing: 'border-box',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'gray',
              cursor: 'pointer',
              fontSize: '16px',
              paddingRight: '5px',
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
                    gap: '6px',
                  }}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt=""
                      style={{
                        width: '20px',
                        height: '20px',
                        objectFit: 'contain',
                      }}
                    />
                  )}
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
