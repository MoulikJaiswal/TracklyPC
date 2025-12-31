
  const handleSaveTest = useCallback(async (newTest: Omit<TestResult, 'id' | 'timestamp'>) => {
    const id = generateUUID();
    const timestamp = Date.now();
    const test: TestResult = { ...newTest, id, timestamp };

    if (user) {
        await setDoc(doc(db, 'users', user.uid, 'tests', id), test);
    } else if (isGuest) {
        setTests(prev => {
            const updated = [test, ...prev];
            localStorage.setItem('trackly_guest_tests', JSON.stringify(updated));
            return updated;
        });
    }
  }, [user, isGuest]);

  const handleDeleteTest = useCallback(async (id: string) => {
