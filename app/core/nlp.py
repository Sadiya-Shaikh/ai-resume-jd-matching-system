import spacy

# Load model once (global object)
nlp = spacy.load("en_core_web_sm")

def get_nlp():
    return nlp