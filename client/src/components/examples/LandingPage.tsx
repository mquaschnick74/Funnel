import LandingPage from '../LandingPage';

export default function LandingPageExample() {
  return (
    <LandingPage
      onStart={() => console.log('Start assessment clicked')}
    />
  );
}
