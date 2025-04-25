import React, { useCallback } from "react";
import { Input, Button, Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Calendar, PlusCircle } from 'lucide-react';
import MemoizedPointInput from "./MemoizedPointInput";

const TGSessionContent = React.memo(({
  selectedDate,
  setSelectedDate,
  pointInputs,
  setPointInputs,
  tgSessions
}) => {
  const handleAddPoint = useCallback(() => {
    setPointInputs(current => [...current, { id: Date.now(), value: '' }]);
  }, [setPointInputs]);

  const handleRemovePoint = useCallback((index) => {
    setPointInputs(current => current.filter((_, i) => i !== index));
  }, [setPointInputs]);

  const handlePointChange = useCallback((index, newValue) => {
    setPointInputs(current =>
      current.map((point, i) =>
        i === index ? { ...point, value: newValue } : point
      )
    );
  }, [setPointInputs]);

  const sortedTGSessions = React.useMemo(() => {
    return [...tgSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tgSessions]);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm mb-6">
           <CardHeader className="flex justify-between">
          
             <h2 className="text-xl font-bold">TG Session</h2>
           </CardHeader>
         
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} />
          <Input
            type="date"
            label="Session Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            variant="bordered"
            className="max-w-xs"
          />
        </div>

        <Divider />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Points Discussed</h3>
          <div className="space-y-2">
            {pointInputs.map((point, index) => (
              <MemoizedPointInput
                key={point.id}
                value={point.value}
                onChange={handlePointChange}
                onRemove={handleRemovePoint}
                canRemove={pointInputs.length > 1}
                index={index}
              />
            ))}
          </div>
          <Button
            color="primary"
            onClick={handleAddPoint}
            className="mt-2"
            startContent={<PlusCircle size={20} />}
          >
            Add Point
          </Button>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-4">Previous TG Sessions</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {sortedTGSessions.length > 0 ? (
              sortedTGSessions.map((session) => (
                <Card key={session.date} className="bg-content2">
                  <CardBody>
                    <h4 className="font-medium mb-2">
                      Date: {new Date(session.date).toLocaleDateString()}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {session.pointsDiscussed.map((point, pointIndex) => (
                        <li key={`${session.date}-point-${pointIndex}`} className="text-sm">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No previous sessions recorded</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

TGSessionContent.displayName = 'TGSessionContent';

export default TGSessionContent;

