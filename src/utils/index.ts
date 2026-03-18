export const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hour = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliSeconds = date.getMilliseconds().toString().padStart(3, "0");
  return `${hour}:${minutes}:${seconds}.${milliSeconds}`;
};
