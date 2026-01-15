// Tasks AIR Test Script
// Paste this into the browser console at http://localhost:5173/project/wcb0aA22ONaEnh2Xj5A2

(async () => {
    console.log('🧪 Testing Tasks AIR...');

    // 1. Import flux
    const { flux } = await import('/src/flux/index.ts');
    console.log('✅ Flux imported');

    // 2. Dispatch SPAWN_AIR action
    flux.dispatch({
        type: 'SPAWN_AIR',
        payload: {
            id: 'tasks-air',
            props: {
                title: 'Browser Console Test',
                initialTasks: [
                    { id: 1, label: 'Verify Tasks AIR loads', completed: false },
                    { id: 2, label: 'Test task completion', completed: false },
                    { id: 3, label: 'Confirm persistence works', completed: false }
                ]
            }
        },
        to: 'controller'
    });
    console.log('✅ SPAWN_AIR dispatched for tasks-air');

    // 3. Wait and check if window appeared
    setTimeout(() => {
        const taskWindow = document.querySelector('[class*="tasksList"]');
        if (taskWindow) {
            console.log('✅ Tasks AIR window found in DOM!');
            console.log('   Tasks:', taskWindow.querySelectorAll('[class*="taskItem"]').length);
        } else {
            console.error('❌ Tasks AIR window NOT found');
        }
    }, 2000);

    return 'Test dispatched. Check console in 2 seconds for results.';
})();
