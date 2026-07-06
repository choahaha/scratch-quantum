const GradeFeedback = ({result}) => {
    if (!result) return null;
    return (
        <div className={`grade-feedback ${result.passed ? 'grade-passed' : 'grade-failed'}`}>
            <h3>{result.passed ? '🎉 미션 성공!' : '아쉬워요, 다시 도전!'}</h3>
            <ul>
                {result.checks.map(check => (
                    <li key={check.id} className={check.passed ? 'check-pass' : 'check-fail'}>
                        {check.passed ? '✔' : '✘'}{' '}
                        {check.passed ? '통과' : check.feedback}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GradeFeedback;
