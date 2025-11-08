import QuizPage from '../QuizPage';

export default function QuizPageExample() {
  return (
    <QuizPage
      onComplete={(answers) => console.log('Quiz completed with answers:', answers)}
    />
  );
}
