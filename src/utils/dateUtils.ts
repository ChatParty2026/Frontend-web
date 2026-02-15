/**
 * 2024-12-10T14:30:00.000... 형식
 * ISO 날짜 문자열을 상대 시간으로 변환
 */
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  
  // 만약 날짜 객체 생성에 실패하면 원본 반환
  if (isNaN(past.getTime())) return dateString;

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}일 전`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}달 전`;
  
  return `${Math.floor(diffInMonths / 12)}년 전`;
};