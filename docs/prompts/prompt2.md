You are given 3 prompt files in the root folder (/prompts folder):
- prompt0 file is a prompt for generating content for the feed page.
- prompt1 file is a prompt for generating initial content for the Topic page
- prompt2 file is a prompt for generating next content for the Topic page to implement infinite scroll there

I want you to write Node.JS backend server that will have the following endpoints:
* GET /feed. This endpoint returns feed by sending prompt0 file to AI LLM model
* GET /topic?name={topicName}. This endpoint returns microcourse by sending prompt1 file to AI
* GET /similar-topics?viewed={topicList}. This endpoint returns similar topics by sending prompt2 to AI 

Use any free AI LLM model to generate content.