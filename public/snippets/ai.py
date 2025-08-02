import ollama
context=[]
len_context=1
research_topic=True
save_topic_to_file=True
while True:
    #checks if the user wants to research a topic
    #ans = input('would you like to just ask a prompt?(y/n)')
    '''if ans=="n":
        ans2=input('What topic? Make it plural')
        topic=ans2
        #makes questions to ask the Ai
        prompts=['what are '+str(topic)+'?','how are '+str(topic)+' used?','what do '+str(topic)+' look like?']
        #the answer list
        answer=[]
        for prompt in prompts:
            #ask the ai
            response = ollama.generate(model='codellama', prompt=prompt)
            #get the responce and put it in the answer list
            answer.append(response['response'])
        #print the answer list, but as a string
        new_answer=''.join(answer)
        print(new_answer)
        if save_topic_to_file==True:
            try:
                open(str(topic),'x').write(str(topic)+":\n"+str(new_answer))
            except Exception as e:
                if e == FileExistsError:
                    ans3=input('File alread exists. Would you like to rename it?(y/n)')
                    if ans3 == 'y':
                        ans4=input('Enter file name: ')
                raise e
    #if it is not a topic, then do this
    else:'''
    #ask the user what they want to ask it
    prompt=input()
    #ask the ai
    response = ollama.generate(model='codellama', prompt=str(prompt))#qwen2.5-coder
    #print the response
    print(response['response'])
    #add context
    context.append(prompt)
    #if context greater then the max amount, remove old context
    if len(context) >= len_context:
        context.pop(0)
        #debug; to make sure everything is working
    #print('DEBUG:',context,'/\\',len_context)
