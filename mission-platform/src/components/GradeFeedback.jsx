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
            {result.counts && (
                <p className="grade-counts">
                    {'채점 검증 결과: '}
                    {Object.entries(result.counts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([state, count]) => `|${state}⟩ ${count}`)
                        .join(', ')}
                    <span className="grade-counts-note">
                        (채점 서버가 제출된 회로를 독립적으로 다시 실행한 결과라, 에디터의 실행 결과와 숫자가 다를 수 있어요)
                    </span>
                </p>
            )}
        </div>
    );
};

export default GradeFeedback;
