const GradeFeedback = ({result}) => {
    if (!result) return null;
    return (
        <div className={`grade-feedback ${result.passed ? 'grade-passed' : 'grade-failed'}`}>
            <h3>{result.passed ? '🎉 Mission passed!' : 'Not yet — try again!'}</h3>
            <ul>
                {result.checks.map(check => (
                    <li key={check.id} className={check.passed ? 'check-pass' : 'check-fail'}>
                        {check.passed ? '✔' : '✘'}{' '}
                        {check.passed ? 'Passed' : check.feedback}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GradeFeedback;
