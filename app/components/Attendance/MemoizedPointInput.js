import React from "react";
import { Input, Button } from "@nextui-org/react";
import { Trash2 } from 'lucide-react';

const MemoizedPointInput = React.memo(({ value, onChange, onRemove, canRemove, index }) => (
  <div className="flex gap-2 items-center">
    <Input
      key={`point-input-${index}`}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      variant="bordered"
      className="flex-grow"
      placeholder={`Point ${index + 1}`}
      aria-label={`Discussion point ${index + 1}`}
    />
    {canRemove && (
      <Button
        isIconOnly
        variant="light"
        color="danger"
        onClick={() => onRemove(index)}
        aria-label="Remove point"
      >
        <Trash2 size={20} />
      </Button>
    )}
  </div>
));

MemoizedPointInput.displayName = 'MemoizedPointInput';

export default MemoizedPointInput;

