import numpy as np
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import scipy as sp
import torch
import shap
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

model = None
tokenizer = None
explainer = None

def start():
    global model, tokenizer, explainer
    bart_labels = ["contradiction", "neutral", "entailment"]
    model = AutoModelForSequenceClassification.from_pretrained("facebook/bart-large-mnli")
    tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-mnli")
    explainer = shap.Explainer(f, tokenizer, output_names=bart_labels)
    print("NLI pipeline started.")

def f(x):
    # wrapper function for model
    # takes in masked string which is in the form: premise <separator token(s)> hypothesis
    outputs = []
    for _x in x:
        encoding = torch.tensor([tokenizer.encode(_x)])
        output = model(encoding)[0].detach().cpu().numpy()
        outputs.append(output[0])
    outputs = np.array(outputs)
    scores = (np.exp(outputs).T / np.exp(outputs).sum(-1)).T
    val = sp.special.logit(scores)
    return val

def predict(group_name, event_title, event_description, rule):
    premise = f"{group_name} is hosting event called {event_title}: {event_description}"
    premise = premise.lower()
    hypothesis = rule

    input_ids = tokenizer.encode(premise, hypothesis, return_tensors="pt")
    logits = model(input_ids)[0]
    probs = logits.softmax(dim=1)

    bart_label_map = {0: "contradiction", 1: "neutral", 2: "entailment"}
    result = {bart_label_map[i]: probs[0][i].item() for i in range(len(bart_label_map))}
    result["decision"] = bart_label_map[probs.argmax().item()]
    return result

def explain(group_name, event_title, event_description, rule, focus_class="entailment"):
    premise = f"{group_name} is hosting event called {event_title}: {event_description}"
    premise = premise.lower()
    hypothesis = rule

    encoded = tokenizer(premise, hypothesis)["input_ids"][
    1:-1
    ]  # ignore the start and end tokens, since tokenizer will naturally add them
    decoded = tokenizer.decode(encoded)
    shap_values = explainer([decoded])  # wrap input in list
    
    # Create the interactive heatmap
    heatmap_fig = create_interactive_heatmap(shap_values, focus_class)
    
    # Convert figure to bytes
    img_buffer = io.BytesIO()
    heatmap_fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
    img_buffer.seek(0)
    
    # Close the figure to free memory
    plt.close(heatmap_fig)
    
    return img_buffer.getvalue()


def create_interactive_heatmap(shap_values, focus_class):
    """Create an interactive heatmap focusing on a specific class"""
    
    shap_vals = shap_values[0].values
    tokens = shap_values[0].data
    class_names = ["contradiction", "neutral", "entailment"]
    
    # Get class index
    class_idx = class_names.index(focus_class)
    values = shap_vals[:, class_idx]
    
    # Create figure
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 10))
    
    # Top plot: Full sentence with color-coded tokens
    colors = plt.cm.RdBu_r(plt.Normalize(vmin=values.min(), vmax=values.max())(values))
    
    # Create text with colored background
    sentence_text = " ".join(tokens)
    ax1.text(0.05, 0.5, sentence_text, fontsize=12, wrap=True, 
             verticalalignment='center', transform=ax1.transAxes)
    
    # Add color bars for each token
    for i, (token, value, color) in enumerate(zip(tokens, values, colors)):
        rect_height = abs(value) * 0.1  # Scale height by importance
        rect = plt.Rectangle((i, 0.3), 0.8, rect_height, 
                           facecolor=color, alpha=0.7, edgecolor='black')
        ax1.add_patch(rect)
        ax1.text(i + 0.4, 0.25, token, rotation=45, ha='right', va='top', fontsize=8)
    
    ax1.set_xlim(-0.5, len(tokens))
    ax1.set_ylim(0, 1)
    ax1.set_title(f'Token Influence on {focus_class.title()} Prediction')
    ax1.axis('off')
    
    # Bottom plot: Traditional heatmap
    sns.heatmap(
        values.reshape(1, -1),
        xticklabels=tokens,
        yticklabels=[focus_class],
        cmap='RdBu_r',
        center=0,
        cbar_kws={'label': 'SHAP Value'},
        ax=ax2,
        annot=True,
        fmt='.3f'
    )
    ax2.set_title(f'SHAP Values Heatmap: {focus_class.title()} Class')
    ax2.set_xlabel('Tokens')
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Print top influential tokens
    token_importance = list(zip(tokens, values))
    token_importance.sort(key=lambda x: abs(x[1]), reverse=True)
    
    print(f"\nTop 10 most influential tokens for {focus_class}:")
    for token, importance in token_importance[:10]:
        direction = "positive" if importance > 0 else "negative"
        print(f"  '{token}': {importance:.4f} ({direction} influence)")
    
    return fig
