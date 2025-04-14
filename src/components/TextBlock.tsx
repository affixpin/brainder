'use client';

interface TextBlockProps {
  content: string;
}

export default function TextBlock({ content }: TextBlockProps) {
  const paragraphs = content.split('\n\n');
  const isTitle = paragraphs.length > 1 && paragraphs[0].includes('?');

  return (
    <div className="relative h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <div className="prose prose-invert max-w-none">
          {paragraphs.map((paragraph, index) => {
            // Check if this is a list
            if (paragraph.includes('\n1.')) {
              const [intro, ...items] = paragraph.split('\n');
              return (
                <div key={index} className="mb-6">
                  <p className="text-lg text-white/90 leading-relaxed mb-3 font-light">
                    {intro}
                  </p>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li 
                        key={i} 
                        className="flex items-start text-lg text-white/90 leading-relaxed font-light"
                      >
                        <span className="text-primary mr-2">{item.split('.')[0]}.</span>
                        <span>{item.split('.')[1]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            // Title styling
            if (index === 0 && isTitle) {
              return (
                <h1 
                  key={index} 
                  className="text-4xl font-bold text-white mb-6 leading-tight"
                >
                  {paragraph}
                </h1>
              );
            }

            // Regular paragraph styling
            return (
              <p 
                key={index} 
                className="text-lg text-white/90 leading-relaxed mb-4 font-light"
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
} 