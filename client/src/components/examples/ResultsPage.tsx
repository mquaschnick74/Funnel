import ResultsPage from '../ResultsPage';

export default function ResultsPageExample() {
  const mockProfile = {
    pattern: 'The Storm Watcher',
    metaphor: 'Storm Watcher',
    description: 'constant anticipation - always scanning the horizon for what might go wrong',
    register: 'imaginary',
    cvdcPattern:
      'you freeze between options, unable to move forward because both paths feel simultaneously right and impossible',
    chronicity:
      "For you, anxiety isn't occasional. It's the weather you live in - perpetual storms that shape how you move through your days.",
    restCapacity: 'Rest feels impossible until every task is complete - but the tasks are never truly done.',
    goal: 'What you long for most is somatic peace - a body that feels calm and settled.',
  };

  const mockAnswers = {
    q1: 'storm_on_horizon',
    q2: 'stand_frozen',
    q3: 'almost_constant',
    q4: 'impossible',
    q5: 'body_calm',
  };

  return (
    <div className="min-h-screen">
      <ResultsPage profile={mockProfile} answers={mockAnswers} />
    </div>
  );
}
