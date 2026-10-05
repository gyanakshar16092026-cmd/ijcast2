import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../../context/JournalContext';

export const SubmitModal = () => {
  const navigate = useNavigate();
  const { isSubmitOpen, setIsSubmitOpen } = useJournal();

  useEffect(() => {
    if (isSubmitOpen) {
      setIsSubmitOpen(false);
      navigate('/submit-paper');
    }
  }, [isSubmitOpen, setIsSubmitOpen, navigate]);

  return null;
};
