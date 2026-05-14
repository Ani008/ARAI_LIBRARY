const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      departments: ['Mechanical', 'Civil', 'Computer', 'Electrical', 'Automotive'],
      categories: ['ASTM', 'BIS', 'DIN', 'ISO', 'SAE'],
      frequencies: ['Daily', 'Monthly', 'Quarterly', 'Bi-Monthly', 'Annual'],
      modes: ['Subscription', 'Exchange', 'Free', 'Membership'],
      languages: ['ENGLISH', 'MARATHI', 'HINDI'],
      statuses: ['Active', 'Disposal'],
      membershipTypes: ['Corporate', 'Educational Institution', 'Individual'],
      paymentFrequencies: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
      paymentStatuses: ['Paid', 'Unpaid'],
      subscriptionTypeOptions: [
        'Automotive Abstracts',
        'ARAI Journal',
        'KC Membership (Option 1)',
        'KC Membership (Option 2)'
      ],
      ajmtPaperStatuses: ['Under Review', 'Accepted', 'Rejected', 'Published'],
      // New Arrivals & News options
      arrivalsNewsTypes: ['New Arrival', 'Daily News', 'Newspaper', 'Announcement', 'Events'],
      priorities: ['Medium', 'High', 'Urgent'],
      itemTypes: ['Book', 'Journal', 'Magazine', 'Standard', 'Thesis', 'Report', 'CD/DVD'],
      newsCategories: ['Technical', 'Academic', 'Research', 'General', 'Sports', 'Entertainment', 'Business', 'Technology'],
      newsStatuses: ['Active', 'Inactive', 'Archived'],
      targetAudienceOptions: ['Students', 'Faculty', 'Staff', 'Public']
    }
  });
});

module.exports = router;