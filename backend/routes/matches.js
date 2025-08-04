const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/matches
// @desc    Get skill matches for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    
    if (!currentUser.skillsToLearn || currentUser.skillsToLearn.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: 'Add skills you want to learn to find matches'
      });
    }

    // Find users who can teach what current user wants to learn
    const teacherMatches = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      skillsToTeach: { 
        $in: currentUser.skillsToLearn.map(skill => new RegExp(skill, 'i'))
      }
    }).select('-password').sort({ rating: -1, totalSessions: -1 });

    // Find users who want to learn what current user can teach
    const learnerMatches = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      skillsToLearn: { 
        $in: currentUser.skillsToTeach.map(skill => new RegExp(skill, 'i'))
      }
    }).select('-password').sort({ createdAt: -1 });

    // Calculate match scores and combine results
    const matches = [];
    
    // Process teacher matches (users who can teach what I want to learn)
    teacherMatches.forEach(teacher => {
      const commonSkills = teacher.skillsToTeach.filter(teachSkill =>
        currentUser.skillsToLearn.some(learnSkill =>
          teachSkill.toLowerCase().includes(learnSkill.toLowerCase()) ||
          learnSkill.toLowerCase().includes(teachSkill.toLowerCase())
        )
      );

      if (commonSkills.length > 0) {
        matches.push({
          user: teacher,
          matchType: 'teacher',
          commonSkills,
          matchScore: commonSkills.length + (teacher.rating || 0) + (teacher.totalSessions || 0) * 0.1
        });
      }
    });

    // Process learner matches (users who want to learn what I can teach)
    learnerMatches.forEach(learner => {
      const commonSkills = learner.skillsToLearn.filter(learnSkill =>
        currentUser.skillsToTeach.some(teachSkill =>
          teachSkill.toLowerCase().includes(learnSkill.toLowerCase()) ||
          learnSkill.toLowerCase().includes(teachSkill.toLowerCase())
        )
      );

      if (commonSkills.length > 0) {
        // Check if this user is already in matches as a teacher
        const existingMatch = matches.find(match => 
          match.user._id.toString() === learner._id.toString()
        );

        if (existingMatch) {
          existingMatch.matchType = 'mutual';
          existingMatch.learnerSkills = commonSkills;
          existingMatch.matchScore += commonSkills.length;
        } else {
          matches.push({
            user: learner,
            matchType: 'learner',
            commonSkills,
            matchScore: commonSkills.length
          });
        }
      }
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches: matches.slice(0, 20), // Limit to top 20 matches
      totalMatches: matches.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/matches/mutual
// @desc    Get mutual skill matches (users who can teach what I want to learn AND want to learn what I can teach)
// @access  Private
router.get('/mutual', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    
    if (!currentUser.skillsToLearn || currentUser.skillsToLearn.length === 0 ||
        !currentUser.skillsToTeach || currentUser.skillsToTeach.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: 'Add both skills to teach and learn to find mutual matches'
      });
    }

    // Find users with mutual skill exchange potential
    const mutualMatches = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      $and: [
        {
          skillsToTeach: { 
            $in: currentUser.skillsToLearn.map(skill => new RegExp(skill, 'i'))
          }
        },
        {
          skillsToLearn: { 
            $in: currentUser.skillsToTeach.map(skill => new RegExp(skill, 'i'))
          }
        }
      ]
    }).select('-password');

    const matches = mutualMatches.map(user => {
      const canTeachMe = user.skillsToTeach.filter(teachSkill =>
        currentUser.skillsToLearn.some(learnSkill =>
          teachSkill.toLowerCase().includes(learnSkill.toLowerCase()) ||
          learnSkill.toLowerCase().includes(teachSkill.toLowerCase())
        )
      );

      const wantsToLearnFromMe = user.skillsToLearn.filter(learnSkill =>
        currentUser.skillsToTeach.some(teachSkill =>
          teachSkill.toLowerCase().includes(learnSkill.toLowerCase()) ||
          learnSkill.toLowerCase().includes(teachSkill.toLowerCase())
        )
      );

      return {
        user,
        matchType: 'mutual',
        canTeachMe,
        wantsToLearnFromMe,
        matchScore: canTeachMe.length + wantsToLearnFromMe.length + (user.rating || 0)
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
