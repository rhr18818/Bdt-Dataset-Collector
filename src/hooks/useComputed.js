import { useMemo } from 'react';
import { B_COMBINATIONS, ENVIRONMENTS, LIGHTING } from '../data/seedData.js';

export function useComputed(state) {
  return useMemo(() => {
    const { sessions, qcChecks, team } = state;

    // --- Total collected ---
    const totalCollected = sessions.reduce((sum, s) => sum + s.imageCount, 0);

    // --- By category ---
    const collectedByCategory = { A: 0, B: 0, C: 0, D: 0 };
    for (const s of sessions) {
      if (s.category in collectedByCategory) collectedByCategory[s.category] += s.imageCount;
    }

    // --- B combinations ---
    const collectedByCombination = {};
    for (const combo of B_COMBINATIONS) collectedByCombination[combo.key] = 0;
    for (const s of sessions) {
      if (s.category === 'B' && s.subcategory && collectedByCombination[s.subcategory] !== undefined) {
        collectedByCombination[s.subcategory] += s.imageCount;
      }
    }

    // --- B random pool ---
    const bRandomCollected = sessions
      .filter(s => s.category === 'B' && s.subcategory === 'random')
      .reduce((sum, s) => sum + s.imageCount, 0);

    // --- C subtasks ---
    const collectedByCSubtask = {};
    for (const s of sessions) {
      if (s.category === 'C' && s.subcategory) {
        collectedByCSubtask[s.subcategory] = (collectedByCSubtask[s.subcategory] || 0) + s.imageCount;
      }
    }

    // --- D matrix ---
    const collectedByDCell = {};
    for (const s of sessions) {
      if (s.category === 'D') {
        for (const env of (s.environments || [])) {
          for (const light of (s.lighting || [])) {
            const k = `${env}||${light}`;
            collectedByDCell[k] = (collectedByDCell[k] || 0) + s.imageCount;
          }
        }
      }
    }

    // --- By denomination ---
    const collectedByDenomination = { 10: 0, 20: 0, 50: 0, 100: 0, 200: 0, 500: 0, 1000: 0 };
    for (const s of sessions) {
      for (const d of (s.denominations || [])) {
        if (d in collectedByDenomination) collectedByDenomination[d] += s.imageCount;
      }
    }

    // --- A denominations ---
    const collectedByADenom = { 10: 0, 20: 0, 50: 0, 100: 0, 200: 0, 500: 0, 1000: 0 };
    for (const s of sessions) {
      if (s.category === 'A') {
        for (const d of (s.denominations || [])) {
          if (d in collectedByADenom) collectedByADenom[d] += s.imageCount;
        }
      }
    }

    // --- Pipeline status ---
    const totalAnnotated = sessions.filter(s => ['annotated','reviewed','approved'].includes(s.status)).reduce((sum, s) => sum + s.imageCount, 0);
    const pendingAnnotation = sessions.filter(s => s.status === 'collected');
    const pendingReview = sessions.filter(s => s.status === 'annotated');
    const pendingApproval = sessions.filter(s => s.status === 'reviewed');
    const approved = sessions.filter(s => s.status === 'approved');
    const totalApproved = approved.reduce((sum, s) => sum + s.imageCount, 0);

    // --- IAA ---
    const iaaScore = qcChecks.length
      ? qcChecks.reduce((sum, q) => sum + q.agreementPct, 0) / qcChecks.length
      : null;

    // --- Per annotator QC ---
    const qcByAnnotator = {};
    for (const q of qcChecks) {
      if (!qcByAnnotator[q.annotatorId]) qcByAnnotator[q.annotatorId] = [];
      qcByAnnotator[q.annotatorId].push(q);
    }

    // --- Alert: annotators with last 3 checks avg < 90% ---
    const qcAlerts = [];
    for (const [annotatorId, checks] of Object.entries(qcByAnnotator)) {
      const last3 = checks.slice(-3);
      if (last3.length >= 1) {
        const avg = last3.reduce((s, q) => s + q.agreementPct, 0) / last3.length;
        if (avg < 90) {
          const member = team.find(m => m.id === annotatorId);
          if (member) qcAlerts.push({ member, avg: avg.toFixed(1) });
        }
      }
    }

    // --- Per member stats ---
    const memberStats = {};
    for (const m of team) {
      const mSessions = sessions.filter(s => s.memberId === m.id);
      const collected = mSessions.reduce((sum, s) => sum + s.imageCount, 0);
      const annotated = sessions.filter(s => s.annotatedBy === m.id).reduce((sum, s) => sum + s.imageCount, 0);
      const lastSession = mSessions.length ? mSessions[mSessions.length - 1] : null;
      const qcChecksForMember = qcByAnnotator[m.id] || [];
      const avgAccuracy = qcChecksForMember.length
        ? qcChecksForMember.reduce((s, q) => s + q.agreementPct, 0) / qcChecksForMember.length
        : null;
      memberStats[m.id] = {
        collected,
        annotated,
        lastActive: lastSession?.timestamp || null,
        sessionCount: mSessions.length,
        avgAccuracy,
        qcCheckCount: qcChecksForMember.length,
      };
    }

    // --- Daily activity (last 14 days) ---
    const now = new Date();
    const dailyActivity = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = sessions
        .filter(s => s.timestamp.slice(0, 10) === dateStr)
        .reduce((sum, s) => sum + s.imageCount, 0);
      dailyActivity.push({ date: dateStr, label: dateStr.slice(5), count });
    }

    // --- Today's feed ---
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayFeed = sessions
      .filter(s => s.timestamp.slice(0, 10) === todayStr)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 20);

    return {
      totalCollected,
      collectedByCategory,
      collectedByCombination,
      bRandomCollected,
      collectedByCSubtask,
      collectedByDCell,
      collectedByDenomination,
      collectedByADenom,
      totalAnnotated,
      pendingAnnotation,
      pendingReview,
      pendingApproval,
      approved,
      totalApproved,
      iaaScore,
      qcAlerts,
      qcByAnnotator,
      memberStats,
      dailyActivity,
      todayFeed,
    };
  }, [state]);
}
