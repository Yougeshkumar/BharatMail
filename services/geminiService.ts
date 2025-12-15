export const generateSmartReplies = async (_emailBody: string): Promise<string[]> => {
  return [
    "Thank you for the update.",
    "I will review this and get back to you.",
    "Sounds good to me."
  ];
};
