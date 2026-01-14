import React from 'react';

const FighterImage = ({ imagePath, fighterName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const imageUrl = imagePath
    ? `http://192.168.100.16:3021/uploads/fighters/${imagePath}`
    : null;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-gray-300`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={fighterName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span class="text-4xl">\ud83e\udd3c</span>';
          }}
        />
      ) : (
        <span className="text-4xl">\ud83e\udd3c</span>
      )}
    </div>
  );
};

export default FighterImage;
