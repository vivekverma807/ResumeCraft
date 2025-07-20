class ResumeStorage {
    static getResumes(userId) {
        return new Promise((resolve, reject) => {
            db.collection('resumes')
                .where('userId', '==', userId)
                .orderBy('lastUpdated', 'desc')
                .get()
                .then(querySnapshot => {
                    const resumes = [];
                    querySnapshot.forEach(doc => {
                        resumes.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    resolve(resumes);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    static saveResume(resume) {
        return new Promise((resolve, reject) => {
            if (resume.id) {
                // Update existing resume
                db.collection('resumes').doc(resume.id).update(resume)
                    .then(() => resolve(resume.id))
                    .catch(error => reject(error));
            } else {
                // Create new resume
                db.collection('resumes').add(resume)
                    .then(docRef => resolve(docRef.id))
                    .catch(error => reject(error));
            }
        });
    }

    static deleteResume(resumeId) {
        return new Promise((resolve, reject) => {
            db.collection('resumes').doc(resumeId).delete()
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    static recordActivity(activity) {
        return db.collection('activity').add({
            ...activity,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}