export const generateSystemNotes = (i: {
  username: string;
  currentState: string;
}) => {
  const dt = new Date();
  const dateString = dt.toISOString().substring(0, 10);
  const timeString =
    dt.getHours().toString().padStart(2, "0") +
    ":" +
    dt.getMinutes().toString().padStart(2, "0");
  return `[Edited by: ${i.username} | Current State: ${i.currentState} | ${dateString} ${timeString}]\n`;
};
