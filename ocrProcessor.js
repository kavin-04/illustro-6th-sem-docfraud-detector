import Tesseract from 'tesseract.js';
/**
 * Extracts text from an image using OCR
 * @param {File} file - The file to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - The OCR result with text and confidence
 */
export const performOCR = async (file, onProgress) => {
  try {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files can be processed with OCR');
    }
    
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => onProgress && onProgress(m)
    });
    
    // Calculate confidence score for document
    const confidence = result.data.confidence;
    const text = result.data.text;
    
    // Check for potential fraud indicators in text content
    const fraudIndicators = detectFraudIndicators(text);
    
    return {
      text,
      confidence,
      fraudIndicators
    };
  } catch (error) {
    console.error('OCR Processing error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

/**
 * Detects potential fraud indicators in the OCR text
 * @param {string} text - The extracted text to analyze
 * @returns {Array<Object>} - List of detected fraud indicators
 */
const detectFraudIndicators = (text) => {
  const indicators = [];
  const normalizedText = text.toLowerCase();
  
  // Common fraud patterns and suspicious keywords
  const suspiciousPatterns = [
    {
      name: 'altered_dates',
      pattern: /(\d{1,2})[\/\-\\](\d{1,2})[\/\-\\](\d{2,4}).*\1[\/\-\\]\2[\/\-\\]\3/i,
      description: 'Possible altered dates detected'
    },
    {
      name: 'unusual_whitespace',
      pattern: /\s{5,}/g,
      description: 'Unusual whitespace that may indicate tampering'
    },
    {
      name: 'suspicious_keywords',
      pattern: /(void|specimen|sample|copy|fake|forged|altered|manipulated|not valid|not official)/i,
      description: 'Suspicious keywords detected'
    },
    {
      name: 'inconsistent_fonts',
      // This is a simplistic check - in reality you'd need image analysis for font detection
      pattern: /([A-Z]{3,}\s+[a-z]{3,}|[a-z]{3,}\s+[A-Z]{3,})/g,
      description: 'Potentially inconsistent typography'
    },
    {
      name: 'potential_monetary_fraud',
      pattern: /(\$\s*\d+[\.\,]\d+\s*0{3,}|\$\s*0{2,}\d+[\.\,]\d+)/i,
      description: 'Suspicious monetary amount formatting'
    }
  ];
  
  // Check for each pattern
  suspiciousPatterns.forEach(item => {
    const matches = normalizedText.match(item.pattern);
    if (matches && matches.length > 0) {
      indicators.push({
        type: item.name,
        description: item.description,
        count: matches.length,
        confidence: calculateIndicatorConfidence(matches.length, normalizedText.length)
      });
    }
  });
  
  return indicators;
};

/**
 * Calculates confidence score for fraud indicators
 * @param {number} matchCount - Number of pattern matches
 * @param {number} textLength - Length of the analyzed text
 * @returns {number} - Confidence score between 0-1
 */
const calculateIndicatorConfidence = (matchCount, textLength) => {
  // Simple algorithm: more matches and shorter text = higher confidence
  // This would be refined based on actual fraud detection requirements
  const baseConfidence = Math.min(0.3 + (matchCount * 0.1), 0.9);
  const lengthFactor = Math.max(0.5, 1 - (textLength / 10000));
  
  return Math.min(baseConfidence * lengthFactor, 0.95);
};

/**
 * Extracts specific data fields from OCR text using patterns
 * @param {string} text - The OCR text to extract data from
 * @param {Object} patterns - Object containing field patterns
 * @returns {Object} - Extracted field values
 */
export const extractDataFields = (text, patterns = {}) => {
  const extractedData = {};
  
  // Loop through each pattern and extract matching data
  Object.entries(patterns).forEach(([fieldName, pattern]) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      extractedData[fieldName] = match[1].trim();
    }
  });
  
  return extractedData;
};

/**
 * Enhances OCR results by applying post-processing corrections
 * @param {string} text - The raw OCR text
 * @returns {string} - Enhanced and corrected text
 */
export const enhanceOCRResults = (text) => {
  if (!text) return '';
  
  // Common OCR mistakes and corrections
  const corrections = [
    {from: /([A-Za-z])0/g, to: '$1O'}, // Replace 0 with O in words
    {from: /l1/g, to: 'li'}, // Fix common 'li' misreading
    {from: /\bI\b/g, to: '1'}, // Fix I being read as 1 in numbers
    {from: /\bO\b/g, to: '0'}, // Fix O being read as 0 in numbers
    {from: /[;:]\)/g, to: ':)'}, // Fix emoticon spacing
    {from: /(\d),(\d)/g, to: '$1.$2'}, // Fix comma as decimal point
    {from: /rn/g, to: 'm'}, // Fix 'rn' as 'm' confusion
  ];
  
  // Apply corrections
  let enhancedText = text;
  corrections.forEach(({from, to}) => {
    enhancedText = enhancedText.replace(from, to);
  });
  
  return enhancedText;
};

export default {
  performOCR,
  extractDataFields,
  enhanceOCRResults
};